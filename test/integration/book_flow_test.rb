require 'test_helper'

class BookFlowTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end

=begin
  # should update this, or figure out what the hell this does
  test "search from root" do
    get "/"
    assert_response :success, "root_path not found"
    assert_select "div[data-react-class='QueryForm']"
    get search_path
    assert_response :success, "search_path not found"
  end
=end


end
