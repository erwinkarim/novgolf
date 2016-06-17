class Amenity < ActiveRecord::Base
  validates :label, presence:true
  validates :name, uniqueness:true, presence:true
end
