
interface User {
  _id: ObjectId | any;

  /** the login name to be used by the user
   */
  username: string;

  /** the password used by the user
   */
  password: string;

  /** email address of the user
   */
  email: string;

  /** first name of the user
   */
  firstName: string;

  /** last name of the user
   */
  lastName: string;

  /** date of birth of the user
   */
  dateofbirth: Date | DateTime;

}

declare type User = User;