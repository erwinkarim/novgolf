module NameGenerator
  PLACE_PREFIX = ["Batu", "Sri", "Kota", "Bukit", "Sungai", "Changkat", "Bukit", "Teluk", "Kuala", "Desa", "Pinggiran", "Puncak", "Mutiara"]
  PLACE = ["Petaling", "Damansara", "Subang", "Shah", "Langat",
    "Keramat", "Ampang", "Melawati", "Bangsar", "Klang", "Elmina", "Rawang", "Selayang",
    "Titiwangsa", "Kinrara", "Puchong", "Kepong", "Gombak", "Kemuning", "Sentul", "Kiara", "Tunku", "Duta", "Meru"]
  PLACE_MODIFIER = ["Jaya", "Setia", "Damai", "Perdana", "Hulu", "Hilir", "Bestari",
    "Alam", "Sentral", "Utara", "Timur", "Selatan", "Barat", "Bharu", "Utama", "Intan", "Permai"]

  LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n"

  FIRST_NAME = ["Mark", "Luke","Matthew", "Jesus", "Muhammad", "Aaron", "Able", "Cain", "Isaac", "Ishmael", "Daniel", "Angela", "Sophie", "Adrian",
    "Lucas", "David", "Kurt", "James"]
  LAST_NAME = ["Combs", "Trump", "Obama", "Williams", "Mercer", "DuBios", "Karim", "Haziq", "Eiman", "Aziz", "Ashraf", "Beyonce", "Cobain"]
  EMAIL_PROVIDER = ["gmail.com", "hotmail.com", "yahoo.com", "facebook.com"]

  def NameGenerator.random_name
      #prefix or modifier
      return 0 == rand(0..1) ?
        "#{PLACE_PREFIX[rand(0..PLACE_PREFIX.length-1)]} #{PLACE[rand(0..PLACE.length-1)]}" :
        "#{PLACE[rand(0..PLACE.length-1)]} #{PLACE_MODIFIER[rand(0..PLACE_MODIFIER.length-1)]}"
  end

  def self.random_username
    return "#{FIRST_NAME[rand(0..FIRST_NAME.length-1)]} #{LAST_NAME[rand(0..LAST_NAME.length-1)]}"
  end

  def self.random_email
    return "#{FIRST_NAME[rand(0..FIRST_NAME.length-1)]}#{LAST_NAME[rand(0..LAST_NAME.length-1)]}#{rand(1..3000)}@#{EMAIL_PROVIDER[rand(0..EMAIL_PROVIDER.length-1)]}"
  end
end
