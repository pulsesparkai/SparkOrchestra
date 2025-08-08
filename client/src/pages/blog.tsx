import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Link } from "wouter";

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Orchestra Blog</h1>
          <p className="text-xl text-gray-400">
            Insights, updates, and best practices for AI agent orchestration
          </p>
        </div>

        <Card className="bg-gray-700 border-gray-600 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-orange-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Coming Soon
            </h2>
            
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We're preparing exciting content about AI agent orchestration, 
              parallel execution strategies, and Orchestra best practices.
            </p>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                Expected launch: Q2 2025
              </div>
              
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future blog posts */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Getting Started with Parallel AI Agents",
              excerpt: "Learn how to design workflows that execute multiple agents simultaneously",
              date: "Coming Soon",
              readTime: "5 min read"
            },
            {
              title: "Orchestra vs Traditional Sequential Processing",
              excerpt: "Performance benchmarks and real-world case studies",
              date: "Coming Soon", 
              readTime: "8 min read"
            }
          ].map((post, index) => (
            <Card key={index} className="bg-gray-700 border-gray-600 opacity-50">
              <CardHeader>
                <CardTitle className="text-white text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}