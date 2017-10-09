class UrTurkCaseHistory < ApplicationRecord
  belongs_to :ur_turk_case
  belongs_to :user, {foreign_key: :action_by}
end
