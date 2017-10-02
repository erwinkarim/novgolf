class Operator::OperatorController < ApplicationController
  before_action :operators_only
  # GET      /operator(.:format)
  def index
  end

  # GET      /operator/console(.:format)
  def turk_console
  end
end
