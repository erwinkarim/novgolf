class User < ActiveRecord::Base
  require "assets/name_generator"
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
    :confirmable, :recoverable, :rememberable, :trackable, :validatable ,
    :omniauthable, :omniauth_providers => [:facebook]

  has_many :user_reservations
  has_many :ur_contacts
  has_many :golf_clubs
  has_many :memberships

  has_many :photos, as: :imageable
  has_many :reviews

  has_one :billing_cycle
  has_many :invoices

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

  #by default, send emails in the background
  def send_devise_notification(notification, *args)
    devise_mailer.send(notification, self, *args).deliver_later
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

  #get usual hangouts
  def hangouts
    id = self.id
    hangouts_sql = UserReservation.where.has{ (created_at > 6.months.ago) & (user_id == id)}.
      select("golf_club_id, count(*) as golf_club_count, 0 as status, 0 as count_member").
      group(:golf_club_id).order("golf_club_count desc").limit(3).to_sql
    results = ActiveRecord::Base.connection.execute(hangouts_sql).map{|x| GolfClub.find(x[0]) }
  end

  # setup the billing cycle based on join date
  def set_billing_cycle
    #ensure that billing cycle is not yet set
    if !self.billing_cycle.nil? then
      raise "User already has billing cycle"
      return
    end

    #ensure that the guy is admin and a few clubs in his belt
    if !self.admin? then
      raise 'User is not admin'
      return
    end

    if self.golf_clubs.length == 0 then
      raise "User don't own any clubs"
      return
    end

    # handle billing cycle on
    # (29,30,31) => 28
    # others, carry on
    bill_cycle_day = [29,30,31].include?(self.created_at.day) ? 28 : self.created_at.day
    bc = BillingCycle.new({user_id:self.id, cycle:bill_cycle_day})
    if bc.save! then
      return bc
    else
      raise "Unable to create billing cycle"
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
