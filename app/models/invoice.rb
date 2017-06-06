class Invoice < ApplicationRecord
  belongs_to :user
  has_many :ur_invoices

  # generate the invoices for the billing cycle
  def self.generate_invoice billing_cycle = BillingCycle.first
    #find out users which has this billing cycle
    #generate invoice for each of the users
  end

  # generate the invoice for a user
  def self.generate_user_invoice user = User.first, billing_date = Date.today
    # billing cycle id is the day of the month
    # get the month of the billing date
    # billing cycle is the day of the month. find out tranx from this months to last months
    # generate the final tally
  end

end
