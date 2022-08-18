import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  private postdSub: Subscription | null = null;
  private authStatusSub: Subscription | null = null;

  userId: string | null = null;
  isAuthenticated = false;
  posts: Post[] = [];
  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  constructor(
    private authService: AuthService,
    public postService: PostService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.authStatusSub = this.authService
      .getAuthStatus()
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.postdSub = this.postService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
  }

  onDelete(postId: string | null) {
    if (!postId) {
      return;
    }

    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onChangePage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy(): void {
    this.authStatusSub?.unsubscribe();
    this.postdSub?.unsubscribe();
  }
}
