-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedMovie" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SavedMovie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- AddForeignKey
ALTER TABLE "SavedMovie" ADD CONSTRAINT "SavedMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
