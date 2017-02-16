class User < ActiveRecord::Base
  require "assets/name_generator"
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
    :confirmable, :recoverable, :rememberable, :trackable, :validatable ,
    :omniauthable, :omniauth_providers => [:facebook]

  has_many :user_reservations
  has_many :golf_clubs
  has_many :memberships

  has_many :photos, as: :imageable
  has_many :reviews

  has_one :profile_picture, class_name:"Photo", foreign_key: :id, primary_key: :profile_picture
  validates_presence_of :role
  validates_presence_of :image_path

  enum role: [:user, :admin, :superadmin ]
  after_initialize :init

  DEFAULT_IMAGE_PATH = "/images/users/default.jpg"

  def init
    self.role ||= 0
    self.image_path ||= DEFAULT_IMAGE_PATH
  end

  # update the memberships sets, membership will arrive in {random_id => {membership_detail}, random_id => {membership_detail} } fashion
  def set_memberships new_memberships={}
    #current_memberships = self.memberships

    self.transaction do
      #delete keys that are not there yet
      Membership.where( :id => self.memberships.map{ |x| x.id} -
        new_memberships.map{ |k,v| v["id"].to_i }.select{ |x| !x.zero?}).each{ |x| x.destroy }

      #create / modify existings keys
      new_memberships.each_pair do |random_id, membership|
        if membership[:id].nil? || membership[:id].empty? then
          #new membership
          if membership[:golf_club_id].nil? || membership[:golf_club_id].empty? then
            #user alt_club_name
            newMembership = self.memberships.new(alt_club_name:membership[:club_name], golf_club_id:nil, expires_at:membership[:expires_at])
          else
            newMembership = self.memberships.new(golf_club_id:membership[:golf_club_id], alt_club_name:nil, expires_at:membership[:expires_at])
          end
          newMembership.save!
        else
          #update current membership
          Rails.logger.info "update current membership #{membership[:id]}"
          current_membership = Membership.find(membership[:id])
          if membership[:golf_club_id].nil? || membership[:golf_club_id].empty? then
            current_membership.update_attributes(alt_club_name:membership[:club_name], golf_club_id:nil, expires_at:membership[:expires_at])
          else
            current_membership.update_attributes(golf_club_id:membership[:golf_club_id], alt_club_name:nil, expires_at:membership[:expires_at])
          end
        end
      end
    end
  end

  def self.from_omniauth(auth)
   where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
     user.email = auth.info.email
     user.password = Devise.friendly_token[0,20]
     user.name = auth.info.name   # assuming the user model has a name
     user.image_path = auth.info.image || DEFAULT_IMAGE_PATH # assuming the user model has an image
   end
  end

  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.facebook_data"] && session["devise.facebook_data"]["extra"]["raw_info"]
        user.email = data["email"] if user.email.blank?
      end
    end
  end

  # to auto generate random user
  def self.generate_random_user
    password = SecureRandom.hex
    user = User.new(
      email:NameGenerator.random_email, name:NameGenerator.random_username, password:password, password_confirmation:password
    )

    user.save!

    return user

  end

  # return a random user
  def self.random
    User.order("RAND()").first
  end
end
