import React from 'react';


export const ArticleCardSkeleton = ({ featured = false, compact = false }) => {
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="animate-pulse">
          <div className="w-full h-32 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex items-center space-x-3">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (featured) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="animate-pulse">
          <div className="w-full h-64 bg-gray-200"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-5/6 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="animate-pulse">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-6">
          <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryFilterSkeleton = () => (
  <div className="flex flex-wrap gap-2 mb-8">
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-full w-20"></div>
      </div>
    ))}
  </div>
);


export const TrendingSectionSkeleton = () => (
  <section className="mb-12">
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
    </div>
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  </section>
);


export const ArticleGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ArticleCardSkeleton key={index} />
    ))}
  </div>
);

export const FeaturedSectionSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
    <div className="lg:col-span-2">
      <ArticleCardSkeleton featured={true} />
    </div>
    <div className="space-y-6">
      <ArticleCardSkeleton compact={true} />
      <ArticleCardSkeleton compact={true} />
    </div>
  </div>
);

export default {
  ArticleCardSkeleton,
  CategoryFilterSkeleton,
  TrendingSectionSkeleton,
  ArticleGridSkeleton,
  FeaturedSectionSkeleton
};