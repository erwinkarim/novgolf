class UrMemberDetail < ActiveRecord::Base
  belongs_to :user_reservation

  validates_presence_of :name, :member_id
end
