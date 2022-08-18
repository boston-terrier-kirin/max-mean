import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private httpClient: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;

    this.httpClient
      .get<{ message: string; posts: any; maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            maxPosts: postData.maxPosts,
            posts: postData.posts.map((post: any) => {
              return {
                id: post._id,
                creator: post.creator,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
              };
            }),
          };
        })
      )
      .subscribe({
        next: (data) => {
          this.posts = data.posts;
          this.postUpdated.next({
            posts: [...this.posts],
            postCount: data.maxPosts,
          });
        },
      });
  }

  getPostUpdateListener() {
    return this.postUpdated.asObservable();
  }

  getPost(postId: string) {
    return this.httpClient.get<Post>(
      `http://localhost:3000/api/posts/${postId}`
    );
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.httpClient
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(
    postId: string | null,
    title: string,
    content: string,
    image: File | string
  ) {
    let postData: FormData | Post;

    /**
     * Editの場合、
     * ・ファイルを更新する場合は、Fileになっている。
     * ・ファイルを更新しない場合は、ファイルパスになっている。
     */
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', postId!);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: postId,
        title,
        content,
        imagePath: image,
        creator: null,
      };
    }

    this.httpClient
      .put(`http://localhost:3000/api/posts/${postId}`, postData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    /**
     * DELETEの場合、URLがもともと / なので、this.router.navigate(['/']); に反応しない。
     * postsPerPageとpostsPerPageがないと、getPostsが呼べないので、PostListComponentでsubscribeする。
     */
    return this.httpClient.delete(`http://localhost:3000/api/posts/${postId}`);
  }
}
