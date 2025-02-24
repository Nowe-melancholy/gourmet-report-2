import { ulid } from 'ulid';

export class Report {
  private constructor(
    private readonly id: string,
    private readonly itemName: string,
    private readonly shopName: string,
    private readonly location: string,
    private readonly rating: number,
  ) {
    this.validateRating(rating);
  }

  public static create(
    itemName: string,
    shopName: string,
    location: string,
    rating: number,
  ): Report {
    return new Report(ulid(), itemName, shopName, location, rating);
  }

  public static reconstruct(
    id: string,
    itemName: string,
    shopName: string,
    location: string,
    rating: number,
  ): Report {
    return new Report(id, itemName, shopName, location, rating);
  }

  private validateRating(rating: number): void {
    if (rating < 1 || rating > 5 || !this.isValidRatingStep(rating)) {
      throw new Error('Rating must be between 1 and 5 with 0.5 steps');
    }
  }

  private isValidRatingStep(rating: number): boolean {
    return rating * 2 % 1 === 0;
  }

  public getId(): string {
    return this.id;
  }

  public getItemName(): string {
    return this.itemName;
  }

  public getShopName(): string {
    return this.shopName;
  }

  public getLocation(): string {
    return this.location;
  }

  public getRating(): number {
    return this.rating;
  }
} 