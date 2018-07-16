# node-multiup
A library for multiup.org

## Functions
 * login(username, password, [callback](https://multiup.org/en/upload/from-api#login))
 * logout()
 * check(linkOfFile, [callback](https://multiup.org/en/upload/from-api#check_validity_file))
 * gethosts([callback](https://multiup.org/en/upload/from-api#get_list_available_host))
 * upload(pathToFile, arrayOfHosts, description, [callback](https://multiup.org/en/upload/from-api#upload_file))
 
 ## Callbacks
 They are always return these parameters:
  * `error` First parameter. An `Error` object, with details what went wrong, or `null` if nothing went wrong.
  * `json` Second parameter. If no error, an object with the data in `JSON` representation. It's keys and values can be found in the links above.
