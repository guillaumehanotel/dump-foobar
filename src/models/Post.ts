import Model from '../orm/model';
import { BelongsTo, Column } from '../orm/decorators';
import Author from './Author';

class Post extends Model {
  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column('text')
  content!: string;

  @Column('datetime')
  date!: any;

  @BelongsTo(Author, 'author_id')
  readonly author?: Author;
}

export default Post
