'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'
import UsernamePrompt from './UsernamePrompt'

export default function ContactModal({ isOpen, onClose, centre }) {
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuth()
  const [comments, setComments] = useState([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Fetch comments when modal opens
      fetchComments()
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, centre?.id])

  const fetchComments = async () => {
    if (!centre?.id) return
    
    setIsLoadingComments(true)
    try {
      // Fetch from API
      const response = await fetch(`/api/discussions/${centre.id}`)
      const data = await response.json()
      
      if (response.ok && data.comments) {
        setComments(data.comments)
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    } finally {
      setIsLoadingComments(false)
    }
  }

  if (!isOpen || !centre) return null

  // Extract display name (remove branch suffix like "(Main)")
  const displayName = centre.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

  const handleWhatsApp = () => {
    window.open(centre.whatsappLink, '_blank')
    onClose()
  }

  const handleWebsite = () => {
    window.open(centre.website, '_blank')
  }

  const handleCommentInputClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else if (!user?.username) {
      setShowUsernamePrompt(true)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    
    // Check if user has username
    if (!user?.username) {
      setShowUsernamePrompt(true)
      return
    }
    
    try {
      const response = await fetch(`/api/discussions/${centre.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: newComment.trim(),
          isAnonymous: false
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to post comment')
      }
      
      // Add new comment to list
      setComments([...comments, data.comment])
      setNewComment('')
    } catch (err) {
      console.error('Failed to post comment:', err)
      alert(err.message || 'Failed to post comment. Please try again.')
    }
  }

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return `${Math.floor(diffInSeconds / 604800)}w`
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-xl flex flex-col max-h-[90vh]">
          {/* Header - Fixed */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-1">
                {displayName}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-cream rounded-lg text-xs text-secondary">
                  {centre.location}
                </span>
                <span className="px-2 py-1 bg-cream rounded-lg text-xs text-secondary">
                  {centre.level}
                </span>
                <span className="px-2 py-1 bg-cream rounded-lg text-xs text-secondary">
                  {centre.subject}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contact options - Fixed */}
          <div className="px-6 pt-4 space-y-3">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all border border-green-200"
            >
              <div className="w-12 h-12 bg-green-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-primary">WhatsApp</p>
                <p className="text-sm text-secondary">Chat directly with the centre</p>
              </div>
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {centre.website && (
              <button
                onClick={handleWebsite}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-primary">Visit Website</p>
                  <p className="text-sm text-secondary">Learn more about the centre</p>
                </div>
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Comments Section - Scrollable */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Comments Header */}
            <div className="px-6 py-4 border-t border-b border-gray-100">
              <h4 className="font-semibold text-gray-900 text-center">Comments</h4>
            </div>

            {/* Comments List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoadingComments ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 mx-auto border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No comments yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        comment.author?.role === 'CENTRE' 
                          ? 'bg-blue-500' 
                          : 'bg-gray-200'
                      }`}>
                        {comment.author?.role === 'CENTRE' ? (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">
                            {comment.isAnonymous || !comment.author 
                              ? 'Anonymous Parent' 
                              : comment.author.username || comment.author.email}
                          </span>
                          {comment.author?.role === 'CENTRE' && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-medium">
                              Centre
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mt-0.5 break-words">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Input - Fixed at bottom */}
            <div className="border-t border-gray-100 p-4">
              {showUsernamePrompt && !user?.username ? (
                <div className="mb-4">
                  <UsernamePrompt onUsernameSet={() => setShowUsernamePrompt(false)} />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                    onClick={handleCommentInputClick}
                    placeholder="Add a comment..."
                    className="flex-1 text-sm border-none outline-none bg-transparent placeholder-gray-400"
                  />
                  {newComment.trim() && isAuthenticated && user?.username && (
                    <button
                      onClick={handlePostComment}
                      className="text-sm font-semibold text-blue-500 hover:text-blue-600"
                    >
                      Post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  )
}
