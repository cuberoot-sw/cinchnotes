class Task < ActiveRecord::Base
  belongs_to :user
  belongs_to :category
  attr_accessible :description, :due_date, :note, :status, :category_id

  # state_machine
  state_machine :status, :initial => :pending do
    event :complete do
      transition [:pending] => :completed
    end
    event :pending do
      transition [:completed] => :pending
    end

    state :pending, :completed
  end

end
