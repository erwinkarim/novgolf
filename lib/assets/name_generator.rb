module NameGenerator
  PLACE_PREFIX = ["", "Sri", "Kota", "Bukit", "Sungai", "Changkat", "Bukit", "Teluk", "Kuala", "Desa", "Pinggiran", "Puncak"]
  PLACE = ["Petaling", "Damansara", "Subang", "Shah", "Langat",
    "Keramat", "Ampang", "Melawati", "Bangsar", "Klang", "Elmina", "Rawang", "Selayang",
    "Titiwangsa", "Kinrara", "Puchong", "Kepong", "Gombak", "Kemuning", "Sentul", ""]
  PLACE_MODIFIER = ["Jaya", "Setia", "Damai", "Perdana", "Hulu", "Hilir", "Bestari",
    "Alam", "Sentral", "Utara", "Timur", "Selatan", "Barat"]

  LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n"

  def NameGenerator.random_name
      #prefix or modifier
      return 0 == rand(0..1) ?
        "#{PLACE_PREFIX[rand(0..PLACE_PREFIX.length-1)]} #{PLACE[rand(0..PLACE.length-1)]}" :
        "#{PLACE[rand(0..PLACE.length-1)]} #{PLACE_MODIFIER[rand(0..PLACE_MODIFIER.length-1)]}"
  end
end
