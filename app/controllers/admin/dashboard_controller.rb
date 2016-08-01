class Admin::DashboardController < ApplicationController
  # GET      /admin/dashboards(.:format)
  def index
  end

  def recreate_versions
    if Rail.env.production? then
      Photo.update_version_s3
      render :text => "ok!!!"
    end
  end
end
