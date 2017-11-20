module ActiveAdmin::SortableTree
  module ControllerActions

    attr_accessor :sortable_options

    def sortable(options = {})
      options.reverse_merge! :sorting_attribute => :position,
                             :parent_method => :parent,
                             :children_method => :children,
                             :roots_method => :roots,
                             :tree => false,
                             :max_levels => 0,
                             :protect_root => false,
                             :collapsible => false, #hides +/- buttons
                             :start_collapsed => false,
                             :sortable => true

      # BAD BAD BAD FIXME: don't pollute original class
      @sortable_options = options

      # disable pagination
      config.paginate = false

      collection_action :sort, :method => :post do
        resource_name = ActiveAdmin::SortableTree::Compatibility.normalized_resource_name(active_admin_config.resource_name)


        errors = []
        if options[:tree]
         if params['id'].present?
            begin
              id        = params[:id].to_s
              parent_id = params[:parent_id].to_s
              prev_id   = params[:prev_id].to_s
              next_id   = params[:next_id].to_s

              if id.empty?
                return render plain: 'Nested set UI error: node id not defined', status: 500
              elsif parent_id.empty? && prev_id.empty? && next_id.empty?
                return render plain: 'Nested set UI error: not defined where to move node', status: 500
              end


              obj = resource_class.find(id)
              if prev_id.empty? && next_id.empty?
                obj.move_to_child_of resource_class.find(parent_id)
              elsif !prev_id.empty?
                obj.move_to_right_of resource_class.find(prev_id)
              elsif !next_id.empty?
                obj.move_to_left_of resource_class.find(next_id)
              end

              message = "<strong>#{I18n.t('admin.actions.nested_set.success')}!</strong>"
              render plain: message
            rescue Exception => e
              resource_class.model.rebuild!
              Rails.logger.error("#{e.class.name}: #{e.message}:\n#{e.backtrace.join("\n")}")
              render plain: "<strong>#{I18n.t('admin.actions.nested_set.error')}</strong>: #{e}", status: 500
            end
          else
              render plain: "<strong>#{I18n.t('admin.actions.nested_set.error')}</strong>: no id", status: 500
          end
        else
          records = []
          params[resource_name].each_pair do |resource, parent_resource|
            parent_resource = resource_class.find(parent_resource) rescue nil
            records << [resource_class.find(resource), parent_resource]
          end
          ActiveRecord::Base.transaction do
            records.each_with_index do |(record, parent_record), position|
              record.send "#{options[:sorting_attribute]}=", position
              errors << {record.id => record.errors} if !record.save
            end
          end
          if errors.empty?
            head 200
          else
            render json: errors, status: 422
          end
        end
      end
    end
  end

  ::ActiveAdmin::ResourceDSL.send(:include, ControllerActions)
end
