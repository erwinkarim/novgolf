class Invoice < ApplicationRecord
  belongs_to :user
  has_many :ur_invoices, :dependent => :destroy
  has_many :invoice_items, :dependent => :destroy
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
              raise "Unabel to save invoice reservation transaction"
              return
            end
        end
      end

      #get the final total
      invoice.update_attribute(:total_billing, invoice.generate_total_billing)
    else
      raise "Unable to save invoice"
      return
    end
    # generate the final tally
  end

  #find a way to rebuild the invoice
  def rebuild_invoice
  end

  #get the final total by tally up the ur_invoice
  def generate_total_billing
    total = 0
    self.ur_invoices.each do |ur_invoice|
      total += ur_invoice.final_total
    end

    total
  end
end
