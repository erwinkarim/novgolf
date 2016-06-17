class AmenityList < ActiveRecord::Base
  belongs_to :golf_club
  belongs_to :amenity

  #each club can have have the amenities appears once (ie, free wifi is only one for each club)
  validates_uniqueness_of :amenity_id, :scope => [:golf_club_id]
end
