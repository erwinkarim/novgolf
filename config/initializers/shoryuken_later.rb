if Rails.env.production? then
  Shoryuken::Later.default_table = "shoryuken_later_schedule"
end
