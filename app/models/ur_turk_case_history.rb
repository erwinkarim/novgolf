class UrTurkCaseHistory < ApplicationRecord
  belongs_to :ur_turk_case
  #action by should return a user object
  #belongs_to :user, {foreign_key: :action_by}
  belongs_to :user, {class_name:'User', foreign_key: :action_by}

  enum action: [:assign_to_me, :confirm, :propose_new_time, :take_ownership, :cancel_reservation, :user_reject_proposal, :user_accept_proposal]
  validates_presence_of :action, :ur_turk_case_id, :action_by
end
