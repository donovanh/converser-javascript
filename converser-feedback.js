// Copyright 2012  converser.io

var converser = converser || {};

converser.api = {

  baseUrl: 'https://api.converser.io',
  appId: 'YOUR API KEY GOES HERE!',      // put your app API key here!

  // Subscribe an identity to the feedback service 
  // It's best if the identity is an email address, but any identifier will work
  // eg
  //      converser.api.subscribe("goo@example.com")
  // 
  // The device knowledge is populated below using phonegap example API calls,
  // you should change these to make sense for your platform.
  // Remember that accurate data here means accurate stats later!
  //
  // Returns true on success, false on failure
  //
  subscribe: function(identity) {
    var data = {
      ident: identity,
      device: {
        os: device.name,          // phonegap
        version: device.version,  // phonegap - don't send if ios!
        model: device.name        // phonegap 
      }
    };

    var response = converser.api.post('/subscribe', JSON.stringify(data));
    
    if (response.status == 201) {
      converser.api.setIdent(response.body);
    } 
    
    // If there's an error, there is error text available
    // in the JSON response ->  { "error_text" : "Oh Noes!"}

    return (response.status != 200 && response.status != 201);
  },
  
  // Send feedback from this device! Parameters are
  //     r (reaction) integer value from 1..5 - where 5 is good
  //     a (area) text item which refers to the area where the reaction occurred, e.g. "usability"
  //     t (text) text item which refers to a freeform text comment from the user
  //
  // e.g.
  //      converser.api.feedback(5, "usability", "socks literally blown off here dude")
  // 
  // Returns true on success, false if something went wrong
  //
  feedback: function(r, a, t) {
    var data = {
      reaction: r,
      area: a,
      text: t
    };
    
    var response = converser.api.post('/feedback', JSON.stringify(data));
    
    // If there's an error, there is error text available
    // in the JSON response ->  { "error_text" : "Oh Noes!"}
    return (response.status != 200 && response.status != 201);
  },

  // Utility function - get the stored device identity
  ident: function () {
    return localStorage.getItem('device-ident');
  },

  // Utility funciton - set the device identity
  setIdent: function(ident) {
    return localStorage.setItem('device-ident', ident);
  },


  // Utility function - synchronous GET with the correct headers
  get: function(path) {
    var body = null;
    var status = 0;
    $.ajax({
      async: false,
      headers: {
        'X-Converser-App-ID': converser.api.appId,
        'X-Converser-Device-ID': converser.api.ident()
      },
      url: converser.api.baseUrl + path,
      complete: function(xhr) {
        status = xhr.status;
        body = xhr.responseText;
      }
    });
    
    return {
      status: status,
      body: body
    };
  },

  // Utility function - synchronous POST with the correct headers
  post: function(path, postData) {
    var body = null;
    var status = 0;
    var hdrs = { 'X-Converser-App-ID': converser.api.appId };

    // In the case where the API call is a subscribe,
    // it should not send a device id, because there 
    // isn't one. The server will always check the 
    // device id if it is present to firewall access
    // and will fail the request if it's null/empty
    
    if (path.indexOf('subscribe') == -1) {
      hdrs ['X-Converser-Device-ID'] = converser.api.ident();
    }
    
    $.ajax({
      type: 'POST',
      async: false,
      headers: hdrs,
      url: converser.api.baseUrl + path,
      data: postData,
      success: function (data) {
        body = data;
      },
      error: function(data) {
        body = data;
      },
      complete: function(xhr) {
        status = xhr.status;
      }
    });
    
    return {
      status: status,
      body: body
    };
  }
};
