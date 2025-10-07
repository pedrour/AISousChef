'use client';

import { useState, useRef, type FormEvent, useEffect } from 'react';
import Image from 'next/image';
import {
  ChefHat,
  Loader2,
  BookOpen,
  Camera,
  Wand2,
  UtensilsCrossed,
  AlertTriangle,
  Plus,
  Video,
  FileImage,
  SwitchCamera,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  generateRecipeFromPhoto,
  generateRecipeFromText,
  generateRandomRecipeAction,
} from './actions';
import type { Recipe } from './actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import RecipeDisplay from '@/components/recipe-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ImageMode = 'file' | 'camera';

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [imageMode, setImageMode] = useState<ImageMode>('file');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');

  const placeholderImage = PlaceHolderImages.find(
    (img) => img.id === 'photo-upload-placeholder'
  )!;

  const password: string = "HardCodedPassWorD-WhatAreyouDoinghERe?";


  useEffect(() => {
    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (imageMode === 'camera') {
      const getCameraStream = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast({
            variant: 'destructive',
            title: 'Camera not supported',
            description: 'Your browser does not support camera access.',
          });
          setHasCameraPermission(false);
          setImageMode('file'); // Fallback to file upload
          return;
        }

        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: cameraFacingMode } 
          });
          setStream(cameraStream);
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = cameraStream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description:
              'Please enable camera permissions in your browser settings.',
          });
          setImageMode('file'); // Fallback to file upload
        }
      };

      getCameraStream();
    } else if (imageMode === 'file' && stream) {
      // Cleanup camera stream when switching to file mode
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if(videoRef.current) videoRef.current.srcObject = null;
    }

    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageMode, cameraFacingMode]);


  const handleAction = async (
    action: () => Promise<{ recipe: Recipe | null; error: string | null }>
  ) => {
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const result = await action();
      if (result.error) {
        setError(result.error);
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: result.error,
        });
      } else if (result.recipe) {
        setRecipe(result.recipe);
      }
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ingredients = textInputRef.current?.value;
    if (!ingredients) {
      toast({
        variant: 'destructive',
        title: 'No ingredients provided',
        description: 'Please enter some ingredients to generate a recipe.',
      });
      return;
    }
    await handleAction(() => generateRecipeFromText(ingredients));
  };

  const handleRandomSubmit = async () => {
    await handleAction(generateRandomRecipeAction);
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      // 4MB limit
      toast({
        variant: 'destructive',
        title: 'Image too large',
        description: 'Please upload an image smaller than 4MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoDataUri = e.target?.result as string;
      setImagePreview(photoDataUri);
      await handleAction(() => generateRecipeFromPhoto(photoDataUri));
    };
    reader.onerror = () => {
      const errorMessage = 'Failed to read the image file.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Image Read Error',
        description: errorMessage,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if(!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const dataUri = canvas.toDataURL('image/jpeg');
    setImagePreview(dataUri);
    handleAction(() => generateRecipeFromPhoto(dataUri));
  };

  const handleSwitchCamera = () => {
    setCameraFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };


  const resetState = () => {
    setRecipe(null);
    setError(null);
    setImagePreview(null);
    if(textInputRef.current) textInputRef.current.value = '';
    if(fileInputRef.current) fileInputRef.current.value = '';
    
    // Stop camera stream on reset
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if(videoRef.current) videoRef.current.srcObject = null;
    }
    setImageMode('file');
    setHasCameraPermission(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative h-52 w-full text-white">
        <Image
          src="/banner.png"
          alt="Banner"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 z-20 flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight font-headline">
              AI Sous Chef
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetState}
            disabled={isLoading}
          >
            <Plus className="w-5 h-5 rotate-45" />
            <span className="sr-only">New Recipe</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <Card className="bg-card/50 lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                What's in Your Kitchen?
              </CardTitle>
              <CardDescription>
                Generate a recipe from ingredients you already have.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">
                    <BookOpen className="mr-2" /> From Text
                  </TabsTrigger>
                  <TabsTrigger value="image">
                    <Camera className="mr-2" /> From Image
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-6">
                  <form onSubmit={handleTextSubmit} className="space-y-4">
                    <Textarea
                      ref={textInputRef}
                      placeholder="e.g., chicken breast, broccoli, garlic, olive oil"
                      rows={5}
                      disabled={isLoading}
                      className="resize-none"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                       <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        <UtensilsCrossed />
                        Generate Recipe
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleRandomSubmit}
                        disabled={isLoading}
                        className="w-full"
                      >
                        <Wand2 /> 
                        Surprise Me!
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="image" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={imageMode === 'file' ? 'default' : 'outline'}
                        onClick={() => setImageMode('file')}
                        disabled={isLoading}
                      >
                        <FileImage /> Upload File
                      </Button>
                      <Button
                        variant={imageMode === 'camera' ? 'default' : 'outline'}
                        onClick={() => setImageMode('camera')}
                        disabled={isLoading}
                      >
                        <Video /> Use Camera
                      </Button>
                    </div>

                    {imageMode === 'file' && (
                      <div
                        className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-background/50"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept="image/*"
                          disabled={isLoading}
                        />
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Ingredients preview"
                            width={400}
                            height={300}
                            className="object-cover rounded-md max-h-64 w-auto"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <Image
                                src={placeholderImage.imageUrl}
                                alt={placeholderImage.description}
                                data-ai-hint={placeholderImage.imageHint}
                                width={120}
                                height={90}
                                className="object-cover rounded-md opacity-30"
                              />
                            </div>
                            <p className="font-semibold">
                              Drop an image or click to browse
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Upload a picture of your ingredients
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {imageMode === 'camera' && (
                      <div className="space-y-4">
                        <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                          {imagePreview ? (
                             <Image
                                src={imagePreview}
                                alt="Captured ingredients"
                                layout="fill"
                                className="object-cover"
                            />
                          ) : (
                            <>
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            {hasCameraPermission === false && (
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                  <Alert variant="destructive">
                                    <AlertTriangle/>
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                      Please allow camera access to use this feature.
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              )}
                            </>
                          )}
                           <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleCapture} disabled={isLoading || !hasCameraPermission || imagePreview !== null} className="w-full">
                            <Camera /> {imagePreview ? 'Re-take' : 'Capture Photo'}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSwitchCamera}
                            disabled={isLoading || !hasCameraPermission || imagePreview !== null}
                          >
                            <SwitchCamera />
                            <span className="sr-only">Switch Camera</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="lg:sticky lg:top-24">
            {isLoading && (
              <Card className="flex flex-col items-center justify-center p-16 animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold">
                  Crafting your recipe...
                </p>
              </Card>
            )}

            {!isLoading && error && (
              <Card className="bg-destructive/10 border-destructive">
                <CardHeader className="flex-row items-center gap-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  <div>
                    <CardTitle className="text-destructive font-headline">
                      Something went wrong
                    </CardTitle>
                    <CardDescription className="text-destructive/80">
                      We couldn't generate a recipe.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive-foreground/90">{error}</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && recipe && (
              <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <RecipeDisplay recipe={recipe} />
              </div>
            )}

            {!isLoading && !error && !recipe && (
              <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed">
                <UtensilsCrossed className="w-12 h-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold font-headline">
                  Your Culinary Creation Awaits
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Your generated recipe will appear here.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
