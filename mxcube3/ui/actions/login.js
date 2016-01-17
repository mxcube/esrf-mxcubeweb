import fetch from 'isomorphic-fetch'

export function doLogin(proposal, password) {
    return function(dispatch) {
         fetch('mxcube/api/v0.1/login', { 
            method: 'POST', 
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ proposal, password })
          }).then(response => response.json())
          .then(json => {
                dispatch(afterLogin(json));
          }, () => { 
              window.error_notification.notify("Could not connect to server");
          })
    }
}

export function afterLogin(data) {
    if (data.status.code=="error")
      return {type: "LOGIN", data:{ }, status: data.status }
    else
      return {type: "LOGIN", data: data, status: data.status }
}

export function doSignOut() {
    return { type: "SIGNOUT" }
}
