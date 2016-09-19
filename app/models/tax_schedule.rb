class TaxSchedule < ActiveRecord::Base
  has_many :charge_schedules
end
