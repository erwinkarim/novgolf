class Invoice < ApplicationRecord
  belongs_to :user
  has_many :ur_invoices, :dependent => :destroy
  has_many :invoice_items, :dependent => :destroy

  accepts_nested_attributes_for :invoice_items, allow_destroy: true

  validates_presence_of(:status)
  validates_uniqueness_of(:user_id, scope:[:start_billing_period, :end_billing_period], message:'- only one invoice per billing period')

  enum status:[:outstanding, :settled]

  after_initialize :init
  def init
    self.status ||= 0
  end

  # generate the invoices for the billing cycle on cycle which is 2 days ago
  #   to ensure that the user_reservations are locked
  def self.generate_invoice billing_cycle_day = (Date.today - 2.days).day
    #find out users which has this billing cycle
    Invoice.transaction do
      User.where.has{ (billing_cycle.eq billing_cycle_day) & (role.in [1,2])}.each do |user|
        Invoice.generate_user_invoice user
      end
    end
    #generate invoice for each of the users
  end

  # generate the invoice for a user
  def self.generate_user_invoice user = User.first, billing_date = Date.today

    #get user billing cycle
    billing_cycle = user.billing_cycle

    # get the month of the billing date
    billing_month = billing_date.month

    s_billing_period = Date.new(billing_date.year, billing_month, billing_cycle)
    billing_period = (s_billing_period-1.month)..s_billing_period

    #ensure there's no invoice in the billing_period already created
    check_invoice = user.invoices.where.has{
      (start_billing_period.gteq billing_period.first) &
      (end_billing_period.lt billing_period.last)
    }.count

    if check_invoice != 0 then
      Rails.logger.warn "#{user.name} already have an invoice in the billing_period #{billing_period.inspect}"
      return
    end

    #generate the invoice
    invoice = user.invoices.new({billing_date:billing_date, start_billing_period:billing_period.first, end_billing_period:billing_period.last})

    # generate the ur_invoice of each clubs
    if invoice.save! then
      # build the invoice
      user.golf_clubs.each do |golf_club|
        golf_club.user_reservations.where(:booking_date => billing_period,
          :status => UserReservation.statuses.select{ |x|
            x == "reservation_confirmed" || x == "payment_confirmed" || x == "requires_members_verification"
          }.values
        ).each do |ur|
            ur_invoice = invoice.ur_invoices.new({
              user_reservation_id:ur.id, golf_club_id:ur.golf_club_id, final_total:ur.invoice_value ,billing_category:ur.reserve_method,
            })
            if ur_invoice.save! then
            else
              raise "Unable to save invoice reservation transaction"
              return
            end
        end
      end

      #get the final total
      invoice.update_attribute(:total_billing, invoice.generate_total_billing)

      #if the invoice total_billing is zero, consider the invoice settled
      if invoice.total_billing.zero? then
        invoice.settled!
      end

      #send an email to notify user invoice is ready
      UserMailer.invoice_is_ready(invoice).deliver_later
    else
      raise "Unable to save invoice"
      return
    end
    # generate the final tally
  end

  #find a way to rebuild the invoice
  def rebuild_invoice
  end

  # show amount user owned in the past 0,30,90, 120+ days
  def self.ageing user = User.first
    invoices = user.invoices
    ageing_matrix = {:"0" => 0.0, :"30"=>0.0, :"90"=> 0.0, :"90+"=>0.0}

    invoices.each do |invoice|
      due_period = invoice.billing_date + 14.days - Date.today
      case
      when  due_period > 0
        ageing_matrix[:"0"] += invoice.total_billing
      when due_period > -30 && due_period < 0
        ageing_matrix[:"30"] += invoice.total_billing
      when due_period > -90 && due_period < -30
        ageing_matrix[:"90"] += invoice.total_billing
      else
        ageing_matrix[:"90+"] += invoice.total_billing
      end
    end

    ageing_matrix
  end

  # show ageing on all invoices
  def self.ageing_all_users
    ageing_matrix = {:"0" => 0.0, :"30"=>0.0, :"90"=> 0.0, :"90+"=>0.0}

    self.all.each do |invoice|
      due_period = invoice.billing_date + 14.days - Date.today
      case
      when  due_period > 0
        ageing_matrix[:"0"] += invoice.total_billing
      when due_period > -30 && due_period < 0
        ageing_matrix[:"30"] += invoice.total_billing
      when due_period > -90 && due_period < -30
        ageing_matrix[:"90"] += invoice.total_billing
      else
        ageing_matrix[:"90+"] += invoice.total_billing
      end
    end

    ageing_matrix
  end

  #return a list of top users and the amount they owe
  def self.top_users
    #top 5 people owe us money
    query = self.joining{user}.
      selecting{ [user.name.as('user_name'), total_billing.sum.as('total_billing_sum')]}.
      group(:'users.name').limit(5).ordering{ total_billing.sum.desc}.to_sql

    results = ActiveRecord::Base.connection.exec_query(query).map{ |x| {:user_name => x["user_name"], :total_billing => x["total_billing_sum"]}}

    #top 5 people we owe money
    query = self.joining{user}.
      selecting{ [user.name.as('user_name'), total_billing.sum.as('total_billing_sum')]}.
      group(:'users.name').limit(5).ordering{ total_billing.sum.asc}.to_sql

    results2 = ActiveRecord::Base.connection.exec_query(query).map{ |x| {:user_name => x["user_name"], :total_billing => x["total_billing_sum"]}}

    #results.map{ |x| {:user_name => x["user_name"], :total_billing => x["total_billing_sum"]}}
    (results + results2).uniq
  end

  #return a list of users with the highest number of activities
  def self.top_user_activities
    query = self.joining{[user, ur_invoices]}.
      selecting{ [user.name.as('user_name'), ur_invoices.id.count.as('ur_invoice_count')]}.
      group(:'users.name').limit(5).ordering{ ur_invoices.id.count.desc}.to_sql

    results = ActiveRecord::Base.connection.exec_query(query)
    results.map{ |x| {:user_name => x["user_name"], :invoice_activities => x["ur_invoice_count"]}}

  end

  def self.invoiceable_users
    User.where(:role => User.roles["admin"]).count
  end

  #record the charges made and update the total_billing and status
  # default params is RM0 is charged through credit card
  def charge amount=0.0, method="pcc", note=''

    invoice_item_category = InvoiceItemCategory.where(code:method).first

    #check the invoice category
    if invoice_item_category.nil? then
      raise "Category not found"
      return
    end

    #create a new invoice_item w/ the appropiate category
    Invoice.transaction do
      invoice_item = self.invoice_items.new({
        invoice_item_category_id:invoice_item_category.id,
        charges:amount,
        note:note
      })

      if invoice_item.save! then
        #update the total billing
        self.update_attribute(:total_billing, self.generate_total_billing)
        if self.total_billing.zero? then
          self.settled!
        end
      else
        raise "failed to save transaction"
        return
      end

    end
  end

  #get the final total by tally up the ur_invoice
  def generate_total_billing
    total = 0
    self.ur_invoices.each do |ur_invoice|
      total += ur_invoice.final_total
    end

    self.invoice_items.each do |invoice_item|
      total += invoice_item.charges
    end

    total
  end
end
