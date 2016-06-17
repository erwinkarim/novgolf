# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

amenities = Amenity.create([
    { name:'hut', label:'Hut'},
    { name:'restaurant', label:'Restaurant'},
    { name:'atm', label:'ATM'},
    { name:'shops', label:'Shops'},
    { name: 'changing_room', label: 'Changing Room'},
    { name: 'free_internet', label: 'Free Internet'},
    { name: 'free_wifi', label: 'Free Wifi'},
    { name: 'lounge', label: 'Lounge'}
  ])
