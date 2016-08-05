class ReviewsController < ApplicationController
  before_action :authenticate_user!, :only => [:new, :create, :update, :destroy, :edit]

  # require in params: :topic_id, :topic_type
  def new
    if !params.has_key?(:topic_id) || !params.has_key?(:topic_type) then
      render :file => "public/404.html", :status => :precondition_failed
      return
    end

    @review = current_user.reviews.new({topic_id:params[:topic_id], topic_type:params[:topic_type]})
  end
end
