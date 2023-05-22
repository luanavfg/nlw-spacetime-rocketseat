import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const redirectURL = new URL('/', request.url)
  return NextResponse.redirect(redirectURL, {
    headers: {
      'Set-Cookie': `token=; Path=/; max-age=0`, // -> Path defines which routes can access the token. Since is set to '/' it will be avaliable for entire application
    },
  })
}
