class Admin::DashboardController < ApplicationController
  # GET      /admin/dashboards(.:format)
  def index
  end

  def recreate_versions
    Photo.update_version_s3

    redirect_to recreate_versions_admin_dashboard_index_path
  end
end
