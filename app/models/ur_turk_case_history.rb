class UrTurkCaseHistory < ApplicationRecord
  belongs_to :ur_turk_case
  belongs_to :user, {foreign_key: :action_by}

  enum action: [:assign_to_me, :confirm, :propose_new_time, :take_ownership, :cancel_reservation]
  validates_presence_of :action, :ur_turk_case_id, :action_by
end
