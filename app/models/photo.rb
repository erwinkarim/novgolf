class Photo < ActiveRecord::Base
  belongs_to :imageable, polymorphic:true
  mount_uploader :avatar, AvatarUploader

  validates :user_id, :presence => true
  validates :imageable_id, :presence => true
  validates :imageable_type, :presence => true

  def to_json
    return {
      :name => self.caption,
      :size => self.avatar.size * 1024,
      :url => self.avatar.url,
      :thumb200 => self.avatar.thumb200.url
    }
  end
end
