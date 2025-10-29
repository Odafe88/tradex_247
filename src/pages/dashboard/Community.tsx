import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, TrendingUp, Award } from "lucide-react";

const topics = [
  { title: "Bitcoin halving discussion", replies: 234, views: "12.5K", category: "Bitcoin" },
  { title: "Best strategies for bear market", replies: 156, views: "8.3K", category: "Trading" },
  { title: "Ethereum 2.0 updates", replies: 89, views: "5.2K", category: "Ethereum" },
  { title: "NFT market trends", replies: 67, views: "3.8K", category: "NFTs" },
];

const Community = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">Connect with other traders and crypto enthusiasts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">24.5K</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-sm text-muted-foreground">Discussions</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">567</div>
              <div className="text-sm text-muted-foreground">Active Now</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-muted-foreground">Top Traders</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Trending Discussions</h2>
            <Button className="bg-primary text-primary-foreground">New Discussion</Button>
          </div>

          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{topic.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="inline-flex items-center gap-1">
                        <span>{topic.replies} replies</span>
                        <span>•</span>
                        <span>{topic.views} views</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {topic.category}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Community;
