class ReviewsController < ApplicationController
  before_action :authenticate_user!, :only => [:new, :create, :update, :destory, :edit]

  def owners_only review
    if review.user_id != current_user.id then
      render :file => "public/404.html", :status => :not_authorized
    end
  end

  # GET      /users/:user_id/reviews
  # optional params
  # => offset, get results after offset value
  def index
    @user = User.find(params[:user_id])

    respond_to do |format|
      format.html
      format.json {
        offset = params.has_key?(:offset) ? params[:offset].to_i : 0
        @reviews = @user.reviews.order(:created_at => :desc).limit(10).offset(offset).map{ |x| x.to_json }
        render json:@reviews
      }
    end
  end

  # GET      /golf_clubs/:golf_club_id/reviews(.:format)
  # something like user_reviews, but for clubs
  def club_reviews
    @club = GolfClub.find(params[:golf_club_id])
    offset = params.has_key?(:offset) ? params[:offset].to_i : 0

    respond_to do |format|
      format.html
      format.json {
        @reviews = @club.reviews.order(:created_at => :desc).limit(10).offset(offset).map{ |x| x.to_json }
        render json:@reviews
      }
    end
  end

  # require in params: :topic_id, :topic_type
  def new
    if !params.has_key?(:topic_id) || !params.has_key?(:topic_type) then
      render :file => "public/404.html", :status => :precondition_failed
      return
    end

    #check if the review has already been done
    case params[:topic_type]
    when "UserReservation"
      reservation = UserReservation.find(params[:topic_id])
      #check if you actually own the reservation
      if reservation.user_id != current_user.id then
        render :file => "public/404.html", :status => :not_authorized
      end

      #check if the reservation is alreday done
      if reservation.review.nil? then
        @review = current_user.reviews.new({topic_id:params[:topic_id], topic_type:params[:topic_type]} )
      else
        @review = reservation.review
        redirect_to edit_user_review_path(current_user, @review)
      end
    else
      #generic new review
      @review = current_user.reviews.new({topic_id:params[:topic_id], topic_type:params[:topic_type]} )
    end


  end

  def create
    @review = current_user.reviews.new(review_params)

    begin
      @review.save!
      flash[:notice] = "Review added"
      redirect_to user_reservation_path(current_user, params[:review][:topic_id])
    rescue
      flash[:error] = @review.errors.full_messages.join(', ')
      Rails.logger.error "Error when creating review: " + @review.errors.full_messages.join(',')
      #redirect_to :back
      render "new"
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
