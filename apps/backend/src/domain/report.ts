// spaciousnessの定数と型定義
export const SPACIOUSNESS = {
  wide: 1,
  narrow: 2,
} as const

export type Spaciousness = typeof SPACIOUSNESS[keyof typeof SPACIOUSNESS]

// cleanlinessの定数と型定義
export const CLEANLINESS = {
  clean: 1,
  dirty: 2,
} as const

export type Cleanliness = typeof CLEANLINESS[keyof typeof CLEANLINESS]

// relaxationの定数と型定義
export const RELAXATION = {
  relaxed: 1,
  busy: 2,
} as const

export type Relaxation = typeof RELAXATION[keyof typeof RELAXATION]

export class Report {
  private constructor(
    private readonly id: string,
    private readonly itemName: string,
    private readonly shopName: string,
    private readonly location: string,
    private readonly rating: number,
    private readonly spaciousness?: Spaciousness,
    private readonly cleanliness?: Cleanliness,
    private readonly relaxation?: Relaxation,
    private readonly imageUrl?: string,
    private readonly comment?: string,
    private readonly date?: Date
  ) {
    this.validateRating(rating)
    if (cleanliness !== undefined) this.validateRating(cleanliness)
    if (relaxation !== undefined) this.validateRating(relaxation)
  }

  public static create(
    id: string,
    itemName: string,
    shopName: string,
    location: string,
    rating: number,
    spaciousness?: Spaciousness,
    cleanliness?: Cleanliness,
    relaxation?: Relaxation,
    imageUrl?: string,
    comment?: string,
    date?: Date
  ): Report {
    return new Report(
      id,
      itemName,
      shopName,
      location,
      rating,
      spaciousness,
      cleanliness,
      relaxation,
      imageUrl,
      comment,
      date
    )
  }

  public static reconstruct(
    id: string,
    itemName: string,
    shopName: string,
    location: string,
    rating: number,
    spaciousness?: Spaciousness,
    cleanliness?: Cleanliness,
    relaxation?: Relaxation,
    imageUrl?: string,
    comment?: string,
    date?: Date
  ): Report {
    return new Report(
      id,
      itemName,
      shopName,
      location,
      rating,
      spaciousness,
      cleanliness,
      relaxation,
      imageUrl,
      comment,
      date
    )
  }

  private validateRating(rating: number): void {
    if (rating < 1 || rating > 5 || !this.isValidRatingStep(rating)) {
      throw new Error('Rating must be between 1 and 5 with 0.5 steps')
    }
  }

  private isValidRatingStep(rating: number): boolean {
    return (rating * 2) % 1 === 0
  }

  public getId(): string {
    return this.id
  }

  public getItemName(): string {
    return this.itemName
  }

  public getShopName(): string {
    return this.shopName
  }

  public getLocation(): string {
    return this.location
  }

  public getRating(): number {
    return this.rating
  }

  public getSpaciousness(): Spaciousness | undefined {
    return this.spaciousness
  }

  public getCleanliness(): Cleanliness | undefined {
    return this.cleanliness
  }

  public getRelaxation(): Relaxation | undefined {
    return this.relaxation
  }

  public getImageUrl(): string | undefined {
    return this.imageUrl
  }

  public getComment(): string | undefined {
    return this.comment
  }

  public getDate(): Date | undefined {
    return this.date
  }
}
