class CreateCategories < ActiveRecord::Migration[4.2]
  def change
    create_table :categories do |t|
      t.string :name
      t.string :ancestry
      t.string :description
      t.integer :position

      t.timestamps
    end
  end
end
