class LineItem < ActiveRecord::Base
  validates_presence_of(:name, :description, :mandatory)
  has_many(:line_item_listings)
end
