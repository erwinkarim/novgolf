class Membership < ActiveRecord::Base
  belongs_to :user
  belongs_to :golf_club

  validates_presence_of :user_id, :expires_at

  validate :golf_club_xor_alt_club_name


  def club_name
    #check of golf_club_id
    (self.golf_club_id.empty? || self.golf_club_id.nil?) ? self.alt_club_name : self.golf_club.name
  end

  private
  # golf_club_id or alt_club_name must be present
  def golf_club_xor_alt_club_name
    unless golf_club_id.blank? ^ alt_club_name.blank? then
      errors.add(:base, "Either golf_club_id or alt_club_name must be filled up")
    end
  end
end
