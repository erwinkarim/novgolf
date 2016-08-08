class ReviewsController < ApplicationController
  before_action :authenticate_user!, :only => [:new, :create, :update, :destory, :edit]

  def owners_only review
    if review.user_id != current_user.id then
      render :file => "public/404.html", :status => :not_authorized
    end
  end

  # require in params: :topic_id, :topic_type
  def new
    if !params.has_key?(:topic_id) || !params.has_key?(:topic_type) then
      render :file => "public/404.html", :status => :precondition_failed
      return
    end

    @review = current_user.reviews.new({topic_id:params[:topic_id], topic_type:params[:topic_type]} )
  end

  def create
    @review = current_user.reviews.new(review_params)

    begin
      @review.save!
      flash[:notice] = "Review added"
      redirect_to user_reservation_path(current_user, params[:review][:topic_id])
    rescue
      flash[:error] = @review.errors.full_messages.join(', ')
      redirect_to :back
    end
  end

  # GET      /users/:user_id/reviews/:id/edit(.:format)
  def edit
    @review = Review.find(params[:id])
    owners_only @review

  end

  # PATCH      /users/:user_id/reviews/:id(.:format)
  def update
    @review = Review.find(params[:id])
    owners_only @review
    @review.assign_attributes(review_params)

    begin
      @review.save!
      flash[:notice] = "Review updated"
      redirect_to user_reservation_path(current_user, params[:review][:topic_id])
    rescue
      flash[:error] = @review.errors.full_messages.join(', ')
      redirect_to :back
    end
  end

  def review_params
    params.require(:review).permit(:rating, :topic_type, :topic_id, :comment, :user_id)
  end
end
