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

  def self.update_version_s3
    self.find_each do |photo|
      photo.avatar.cache_stored_file!
      photo.avatar.retrieve_from_cache!(photo.avatar.cache_name)
      photo.avatar.recreate_versions!
      photo.save!
    end
  end
end
