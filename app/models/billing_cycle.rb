class BillingCycle < ApplicationRecord
  #ensure unique user_id

  belongs_to :user
  validates_uniqueness_of :user_id
end
