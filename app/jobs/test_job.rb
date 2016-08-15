class TestJob < ActiveJob::Base
  queue_as :default

  def perform msg
    puts "#{DateTime.now}: #{msg}"
    # Do something later
  end
end
