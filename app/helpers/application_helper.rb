module ApplicationHelper
  def flash_class flash_type
    flash_type_text = flash_type.to_s
    case flash_type_text
    when 'success'
      return 'success'
    when 'notice'
      return 'info'
    when 'alert'
      return 'danger'
    else
      return 'info'
    end
  end
end
