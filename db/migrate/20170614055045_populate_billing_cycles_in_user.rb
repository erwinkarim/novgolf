class PopulateBillingCyclesInUser < ActiveRecord::Migration[5.0]
  def up
    User.all.each{|user| user.set_billing_cycle}
  end

  def down
    User.all.each{ |user| user.update_attribute(billing_cycle:nil)}
  end
end
