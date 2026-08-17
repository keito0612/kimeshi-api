import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { restaurantsRoute } from './routes/restaurants'
import { historyRoute } from './routes/history'
import { healthRoute } from './routes/health'
import { ApiError } from './utils/error'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.route('/health', healthRoute)
app.route('/restaurants', restaurantsRoute)
app.route('/history', historyRoute)

// Error handling
app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      { error: { message: err.message, code: err.code } },
      err.status
    )
  }

  console.error('Unexpected error:', err)
  return c.json(
    { error: { message: 'Internal Server Error', code: 'INTERNAL_ERROR' } },
    500
  )
})

// Not found
app.notFound((c) => {
  return c.json(
    {
      error: {
        message: 'Not Found',
        code: 'NOT_FOUND',
      },
    },
    404
  )
})

export default app
