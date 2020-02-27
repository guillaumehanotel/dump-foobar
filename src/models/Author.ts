import Model from '../orm/model';
import Post from './Post';
import { Column, HasMany } from '../orm/decorators';

class Author extends Model {
  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column()
  email!: string;

  @Column('date')
  birthdate!: any;

  @Column('datetime')
  added!: any;

  @HasMany(Post, 'author_id')
  readonly posts?: Post[]

  sayMyName(): void {
    console.log(this.first_name);
  }
}

export default Author
