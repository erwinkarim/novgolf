class LineItemListing < ActiveRecord::Base
  belongs_to :charge_schedule
  belongs_to :line_item

  validates_presence_of :charge_schedule_id, :line_item_id, :rate, :taxed
end
