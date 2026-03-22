interface Activity {
  id: string
  type: 'critical' | 'success' | 'info' | 'warning'
  message: string
  product?: string
  time: string
  location?: string
}

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'critical':
        return 'var(--red)'
      case 'success':
        return 'var(--green)'
      case 'info':
        return 'var(--blue)'
      case 'warning':
        return 'var(--amber)'
      default:
        return 'var(--blue)'
    }
  }

  return (
    <div className="card activity-card">
      <div className="card-hd">
        <div>
          <div className="section-title">Activity</div>
          <div className="section-sub">Live across all locations</div>
        </div>
        <button className="ghost-btn">All →</button>
      </div>
      <div>
        {activities.length === 0 ? (
          <div
            style={{
              padding: '32px 22px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
            }}
          >
            No recent activity
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div
                className="a-dot"
                style={{ background: getColor(activity.type) }}
              />
              <div>
                <div
                  className="a-text"
                  dangerouslySetInnerHTML={{ __html: activity.message }}
                />
                <div className="a-time">
                  {activity.time}
                  {activity.location && ` · ${activity.location}`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
