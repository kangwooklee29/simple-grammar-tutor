"""
gcp_app_engine/blueprints/auth/views.py
"""

from flask import Blueprint, current_app, redirect, request
from flask import session, url_for
import requests

blueprint_auth = Blueprint('auth', __name__)


@blueprint_auth.route('/login')
def login():
    """
    Handle Google Login request.

    Returns:
    - Response: Google OAuth Authorize Redirect
    """
    if 'profile' in session:
        return redirect(url_for('main.index'))
    return current_app.google_oauth.authorize_redirect(url_for(
        'auth.authorized', _external=True),
                                                       prompt='consent')


@blueprint_auth.route('/login/callback', methods=['GET', 'POST'])
def authorized():
    """
    Process the login request and redirect to the index page or join page.

    Returns:
    - Response: The redirect object
    """

    if 'state' not in request.args:
        # Invalid state, possibly due to CSRF
        return "Invalid state parameter", 400
    else:
        token = current_app.google_oauth.authorize_access_token()
        session['profile'] = current_app.google_oauth.get(
            'https://www.googleapis.com/oauth2/v1/userinfo').json()
        session['access_token'] = token['access_token']

    return redirect(url_for('main.index'))


@blueprint_auth.route('/logout')
def logout():
    """
    Process the logout request

    Returns:
    - Response: The redirect object
    """
    access_token = session.get('access_token')
    if access_token:
        response = requests.post('https://oauth2.googleapis.com/revoke',
                                 data={'token': access_token},
                                 timeout=10)
        if response.status_code != 200:
            print("Token revocation failed. Error:", response.text)

    session.clear()
    return redirect(url_for('main.index'))
